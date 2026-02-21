module {
  public type OldActor = {
    // Previous actor state
  };
  public type NewActor = {
    // New actor state after migration
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    // Transform old state to new state
    {};
  };
};
