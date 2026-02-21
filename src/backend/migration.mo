import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type BinderTheme = {
    coverColor : Text;
    coverTexture : ?Text;
    pageBackground : Text;
    cardFrameStyle : Text;
    textColor : Text;
    accentColor : Text;
    borderStyle : Text;
    backgroundPattern : ?Text;
  };

  type CardRarity = {
    #common;
    #rare;
    #legendary;
    #ultraRare;
    #none;
  };

  type CardCondition = {
    #mint;
    #nearMint;
    #good;
    #fair;
    #played;
    #none;
  };

  type CardPosition = {
    page : Nat;
    slot : Nat;
  };

  type Photocard = {
    id : Text;
    name : Text;
    image : Storage.ExternalBlob;
    created : Int;
    position : CardPosition;
    quantity : Nat;
    rarity : CardRarity;
    condition : CardCondition;
  };

  type Binder = {
    id : Text;
    name : Text;
    created : Int;
    theme : BinderTheme;
    variants : Map.Map<Text, Text>;
    cards : List.List<Photocard>;
  };

  type UserData = {
    binders : Map.Map<Text, Binder>;
  };

  type UserSettings = {
    gridLayout : Text;
  };

  type SubscriptionStatus = {
    #free;
    #pro;
  };

  type UserProfile = {
    name : Text;
    displayName : ?Text;
    email : ?Text;
    avatarUrl : ?Text;
  };

  // Old (array-based) type.
  type OldActor = {
    users : Map.Map<Principal, UserData>;
    userProfiles : Map.Map<Principal, UserProfile>;
    subscriptionStatus : Map.Map<Principal, SubscriptionStatus>;
    defaultLayout : Text;
    layoutPresets : List.List<Text>;
    userSettings : Map.Map<Principal, UserSettings>;
  };

  // New (map-based) type
  type NewActor = {
    users : Map.Map<Principal, UserData>;
    userProfiles : Map.Map<Principal, UserProfile>;
    subscriptionStatus : Map.Map<Principal, SubscriptionStatus>;
    defaultLayout : Text;
    layoutPresets : Map.Map<Text, ()>;
    userSettings : Map.Map<Principal, UserSettings>;
  };

  public func run(old : OldActor) : NewActor {
    let newLayoutPresets = Map.empty<Text, ()>();
    old.layoutPresets.values().forEach(
      func(layout) {
        newLayoutPresets.add(layout, ());
      }
    );
    { old with layoutPresets = newLayoutPresets };
  };
};
