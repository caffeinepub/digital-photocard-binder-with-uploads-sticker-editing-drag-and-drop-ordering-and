import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type CardPosition = {
    page : Nat;
    slot : Nat;
  };

  public type BinderTheme = {
    coverColor : Text;
    coverTexture : ?Text;
    pageBackground : Text;
    cardFrameStyle : Text;
    textColor : Text;
    accentColor : Text;
    borderStyle : Text;
    backgroundPattern : ?Text;
  };

  public type Photocard = {
    id : Text;
    name : Text;
    image : Storage.ExternalBlob;
    created : Time.Time;
    position : CardPosition;
    quantity : Nat;
  };

  public type Binder = {
    id : Text;
    name : Text;
    created : Time.Time;
    theme : BinderTheme;
    variants : Map.Map<Text, Text>;
    cards : List.List<Photocard>;
  };

  public type BinderView = {
    id : Text;
    name : Text;
    created : Time.Time;
    theme : BinderTheme;
    cards : [Photocard];
  };

  module BinderView {
    public func compare(view1 : BinderView, view2 : BinderView) : Order.Order {
      Text.compare(view1.id, view2.id);
    };
  };

  public type UserData = {
    binders : Map.Map<Text, Binder>;
  };

  public type UserProfile = {
    name : Text;
    displayName : ?Text;
    avatarUrl : ?Text;
  };

  module Binder {
    public func compare(binder1 : Binder, binder2 : Binder) : Order.Order {
      switch (Text.compare(binder1.name, binder2.name)) {
        case (#equal) { Text.compare(binder1.id, binder2.id) };
        case (order) { order };
      };
    };

    public func new(id : Text, name : Text, theme : BinderTheme) : Binder {
      {
        id;
        name;
        created = Time.now();
        theme;
        variants = Map.empty<Text, Text>();
        cards = List.empty<Photocard>();
      };
    };

    public func addCard(binder : Binder, card : Photocard) {
      binder.cards.add(card);
    };

    public func removeCard(binder : Binder, cardId : Text) {
      let filtered = binder.cards.filter(
        func(c) { c.id != cardId }
      );
      binder.cards.clear();
      binder.cards.addAll(filtered.values());
    };

    public func updateCard(binder : Binder, updatedCard : Photocard) {
      removeCard(binder, updatedCard.id);
      addCard(binder, updatedCard);
    };

    public func toView(binder : Binder) : BinderView {
      {
        id = binder.id;
        name = binder.name;
        created = binder.created;
        theme = binder.theme;
        cards = binder.cards.toArray();
      };
    };
  };

  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Binder management functions
  public shared ({ caller }) func createBinder(name : Text, theme : BinderTheme) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create binders");
    };
    let userData = getOrCreateUser(caller);
    let binderId = Time.now().toText();
    let newBinder = Binder.new(binderId, name, theme);
    userData.binders.add(binderId, newBinder);
    binderId;
  };

  public query ({ caller }) func getBinders() : async [BinderView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view binders");
    };
    let userData = users.get(caller);
    switch (userData) {
      case (null) { [] };
      case (?data) {
        data.binders.values().toArray().map<Binder, BinderView>(func(b) { Binder.toView(b) }).sort();
      };
    };
  };

  public shared ({ caller }) func addPhotocard(
    binderId : Text,
    name : Text,
    image : Storage.ExternalBlob,
    position : CardPosition,
    quantity : Nat,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photocards");
    };
    let userData = getOrCreateUser(caller);
    let binder = userData.binders.get(binderId);
    switch (binder) {
      case (null) { Runtime.trap("Binder not found") };
      case (?b) {
        let cardId = Time.now().toText();
        let newCard = {
          id = cardId;
          name;
          image;
          created = Time.now();
          position;
          quantity;
        };
        Binder.addCard(b, newCard);
        userData.binders.add(binderId, b);
        cardId;
      };
    };
  };

  public shared ({ caller }) func deleteBinder(binderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete binders");
    };
    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("User not found") };
      case (?data) {
        if (not data.binders.containsKey(binderId)) {
          Runtime.trap("Binder not found");
        };
        data.binders.remove(binderId);
      };
    };
  };

  public shared ({ caller }) func updateBinderTheme(binderId : Text, newTheme : BinderTheme) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update binder themes");
    };
    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("User not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Binder not found") };
          case (?b) {
            let updatedBinder = { b with theme = newTheme };
            data.binders.add(binderId, updatedBinder);
          };
        };
      };
    };
  };

  public shared ({ caller }) func reorderCards(binderId : Text, newOrder : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reorder cards");
    };
    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("User not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Binder not found") };
          case (?b) {
            let cardsArray = b.cards.toArray();
            let reorderedCards = newOrder.map(
              func(cardId) {
                switch (cardsArray.find(func(c) { c.id == cardId })) {
                  case (null) { Runtime.trap("Invalid card order") };
                  case (?card) { card };
                };
              }
            );
            b.cards.clear();
            b.cards.addAll(reorderedCards.values());
          };
        };
      };
    };
  };

  func getOrCreateUser(user : Principal) : UserData {
    switch (users.get(user)) {
      case (null) {
        let newUser = {
          binders = Map.empty<Text, Binder>();
        };
        users.add(user, newUser);
        newUser;
      };
      case (?existing) { existing };
    };
  };
};
