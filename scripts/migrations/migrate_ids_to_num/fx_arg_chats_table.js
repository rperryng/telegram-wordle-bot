{
  ...this,
  Table: {
    ...(this.Table),
    AttributeDefinitions: [
      {
        AttributeName: "chatId",
        AttributeType: "S",
      },
      {
        AttributeName: "userId",
        AttributeType: "S",
      },
    ],
  }
}
