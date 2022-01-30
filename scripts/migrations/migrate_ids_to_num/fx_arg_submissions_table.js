{
  ...this,
  Table: {
    ...(this.Table),
    AttributeDefinitions: [
      {
        AttributeName: "userId",
        AttributeType: "S",
      },
      {
        AttributeName: "wordleNumber",
        AttributeType: "N"
      }
    ],
  }
}
