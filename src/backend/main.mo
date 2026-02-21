import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  type StripeKeys = {
    publishableKey : Text;
    secretKey : Text;
  };

  let stripeKeysStore = Map.empty<Text, StripeKeys>();

  public type SubscriptionStatus = {
    #free;
    #pro;
  };

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

  public type CardRarity = {
    #common;
    #rare;
    #legendary;
    #ultraRare;
    #none;
  };

  public type CardCondition = {
    #mint;
    #nearMint;
    #good;
    #fair;
    #played;
    #none;
  };

  public type Photocard = {
    id : Text;
    name : Text;
    image : Storage.ExternalBlob;
    created : Time.Time;
    position : CardPosition;
    quantity : Nat;
    rarity : CardRarity;
    condition : CardCondition;
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

  public type UserData = {
    binders : Map.Map<Text, Binder>;
  };

  public type UserProfile = {
    name : Text;
    displayName : ?Text;
    email : ?Text;
    avatarUrl : ?Text;
  };

  module Binder {
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
  let subscriptionStatus = Map.empty<Principal, SubscriptionStatus>();
  var defaultLayout : Text = "3x3";
  var layoutPresets = Map.empty<Text, ()>();

  public type UserAnalytics = {
    principal : Principal;
    binderCount : Nat;
    cardCount : Nat;
    subscriptionStatus : SubscriptionStatus;
    joinDate : Time.Time;
    email : ?Text;
  };

  public type AdminContentSettings = {
    logo : ?Storage.ExternalBlob;
    background : ?Storage.ExternalBlob;
    termsAndConditions : Text;
    masterAdminKey : ?Text;
  };

  var adminContentSettings : AdminContentSettings = {
    logo = null;
    background = null;
    termsAndConditions = "Default terms and conditions";
    masterAdminKey = ?"7vX#2kL!m9$Q";
  };

  public type UserSettings = {
    gridLayout : Text;
  };

  let userSettings = Map.empty<Principal, UserSettings>();

  public shared ({ caller }) func saveStripeKeys(publishableKey : Text, secretKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can save Stripe keys");
    };

    let stripeKeyEntry : StripeKeys = {
      publishableKey;
      secretKey;
    };

    stripeKeysStore.add("singleton", stripeKeyEntry);

    let allowedCountries = [
      "US", "CA", "GB", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "IE", "LU", "PT", "FI", "SE", "DK", "NO", "IS", "CH", "LIE", "MC", "SM", "VA", "AD", "MT", "GR", "CY", "EE", "LT", "LV", "PL", "CZ", "SK", "HU", "SI", "BG", "RO", "HR", "RU",
    ];

    stripeConfiguration := ?{
      secretKey;
      allowedCountries;
    };
  };

  public query func getStripePublishableKey() : async Text {
    getStripeKeys().publishableKey;
  };

  func getStripeKeys() : StripeKeys {
    switch (stripeKeysStore.get("singleton")) {
      case (null) { Runtime.trap("Initialization: Stripe must be configured first") };
      case (?keys) { keys };
    };
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can save Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  public query ({ caller }) func getAllUsers() : async [UserAnalytics] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view users");
    };
    users.toArray().map(
      func((id, data)) {
        let binders = data.binders;
        let totalCards = binders.values().foldLeft(
          0,
          func(acc, binder) {
            acc + binder.cards.size();
          },
        );
        let profile = userProfiles.get(id);
        {
          principal = id;
          binderCount = binders.size();
          cardCount = totalCards;
          subscriptionStatus = switch (subscriptionStatus.get(id)) {
            case (null) { #free };
            case (?status) { status };
          };
          joinDate = 0;
          email = switch (profile) {
            case (null) { null };
            case (?p) { p.email };
          };
        };
      }
    );
  };

  public query ({ caller }) func getFilteredUsers(filter : Text) : async [UserAnalytics] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter users");
    };

    let filteredUsers = if (filter.isEmpty()) {
      users.toArray();
    } else {
      users.toArray().filter(
        func((id, data)) {
          let profile = userProfiles.get(id);
          switch (profile) {
            case (null) { false };
            case (?p) {
              switch (p.email) {
                case (null) { false };
                case (?email) {
                  email.contains(#text(filter));
                };
              };
            };
          };
        }
      );
    };

    filteredUsers.map(
      func((id, data)) {
        let binders = data.binders;
        let totalCards = binders.values().foldLeft(
          0,
          func(acc, binder) {
            acc + binder.cards.size();
          },
        );
        let profile = userProfiles.get(id);
        {
          principal = id;
          binderCount = binders.size();
          cardCount = totalCards;
          subscriptionStatus = switch (subscriptionStatus.get(id)) {
            case (null) { #free };
            case (?status) { status };
          };
          joinDate = 0;
          email = switch (profile) {
            case (null) { null };
            case (?p) { p.email };
          };
        };
      }
    );
  };

  public query ({ caller }) func getBindersByUser(user : Principal) : async [BinderView] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view user binders");
    };
    let userData = users.get(user);
    switch (userData) {
      case (null) { [] };
      case (?data) {
        data.binders.values().toArray().map(func(b) { Binder.toView(b) });
      };
    };
  };

  public query ({ caller }) func getAdminContentSettings() : async AdminContentSettings {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get content settings");
    };
    adminContentSettings;
  };

  public shared ({ caller }) func getMasterAdminKey() : async ?Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get master admin key");
    };
    adminContentSettings.masterAdminKey;
  };

  public shared ({ caller }) func updateMasterAdminKey(newKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update master admin key");
    };
    adminContentSettings := { adminContentSettings with masterAdminKey = ?newKey };
  };

  public shared ({ caller }) func updateAdminContentSettings(settings : AdminContentSettings) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update content");
    };
    adminContentSettings := settings;
  };

  public shared ({ caller }) func updateSubscriptionStatus(user : Principal, status : SubscriptionStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update subscription status");
    };
    subscriptionStatus.add(user, status);
  };

  public query ({ caller }) func getSubscriptionStatus() : async SubscriptionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subscription status");
    };
    switch (subscriptionStatus.get(caller)) {
      case (null) { #free };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
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

  public shared ({ caller }) func createBinder(name : Text, theme : BinderTheme) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create binders");
    };

    let userData = getOrCreateUser(caller);

    let status = switch (subscriptionStatus.get(caller)) {
      case (null) { #free };
      case (?status) { status };
    };

    let currentBinderCount = userData.binders.size();
    let maxBinders = switch (status) {
      case (#free) { 2 };
      case (#pro) { 5 };
    };

    if (currentBinderCount >= maxBinders) {
      Runtime.trap("Binder limit reached: Upgrade your subscription to add more binders");
    };

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
      case (?data) { data.binders.values().toArray().map(func(b) { Binder.toView(b) }) };
    };
  };

  public shared ({ caller }) func addPhotocard(
    binderId : Text,
    name : Text,
    image : Storage.ExternalBlob,
    position : CardPosition,
    quantity : Nat,
    rarity : CardRarity,
    condition : CardCondition,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photocards");
    };

    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Unauthorized: Binder not found") };
          case (?b) {
            let cardId = Time.now().toText();
            let newCard = {
              id = cardId;
              name;
              image;
              created = Time.now();
              position;
              quantity;
              rarity;
              condition;
            };
            Binder.addCard(b, newCard);
            data.binders.add(binderId, b);
            cardId;
          };
        };
      };
    };
  };

  public shared ({ caller }) func updatePhotocard(
    binderId : Text,
    cardId : Text,
    name : Text,
    image : Storage.ExternalBlob,
    position : CardPosition,
    quantity : Nat,
    rarity : CardRarity,
    condition : CardCondition,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photocards");
    };

    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Unauthorized: Binder not found") };
          case (?b) {
            let cardsArray = b.cards.toArray();
            let existingCard = cardsArray.find(func(c) { c.id == cardId });
            switch (existingCard) {
              case (null) { Runtime.trap("Card not found") };
              case (?card) {
                let updatedCard = {
                  id = cardId;
                  name;
                  image;
                  created = card.created;
                  position;
                  quantity;
                  rarity;
                  condition;
                };
                Binder.updateCard(b, updatedCard);
                data.binders.add(binderId, b);
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deletePhotocard(binderId : Text, cardId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete photocards");
    };

    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Unauthorized: Binder not found") };
          case (?b) {
            Binder.removeCard(b, cardId);
            data.binders.add(binderId, b);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteBinder(binderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete binders");
    };

    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        if (not data.binders.containsKey(binderId)) {
          Runtime.trap("Unauthorized: Binder not found");
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
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Unauthorized: Binder not found") };
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
      case (null) { Runtime.trap("Unauthorized: Binder not found") };
      case (?data) {
        let binder = data.binders.get(binderId);
        switch (binder) {
          case (null) { Runtime.trap("Unauthorized: Binder not found") };
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

  public shared ({ caller }) func addLayoutPreset(layout : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add layout presets");
    };
    if (not layoutPresets.containsKey(layout)) {
      layoutPresets.add(layout, ());
    };
  };

  public shared ({ caller }) func removeLayoutPreset(layout : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove layout presets");
    };
    layoutPresets.remove(layout);
  };

  public shared ({ caller }) func setDefaultLayout(layout : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set default layout");
    };
    if (not layoutPresets.containsKey(layout)) {
      Runtime.trap("Cannot set default layout: Provided layout must be present in presets");
    };
    defaultLayout := layout;
  };

  public query func getLayoutPresets() : async [Text] {
    layoutPresets.keys().toArray();
  };

  public query func getDefaultLayout() : async Text {
    defaultLayout;
  };

  public query ({ caller }) func getUserLayout() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view layout preferences");
    };
    switch (userSettings.get(caller)) {
      case (null) { defaultLayout };
      case (?settings) { settings.gridLayout };
    };
  };

  public shared ({ caller }) func updateUserLayout(layout : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update layout preferences");
    };

    if (not layoutPresets.containsKey(layout)) {
      Runtime.trap("Layout must be a valid preset");
    };
    switch (userSettings.get(caller)) {
      case (null) {
        let settings : UserSettings = {
          gridLayout = layout;
        };
        userSettings.add(caller, settings);
      };
      case (?existing) {
        userSettings.add(caller, { existing with gridLayout = layout });
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
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

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) {
        Runtime.trap("Stripe needs to be first configured");
      };
      case (?config) { config };
    };
  };
};
