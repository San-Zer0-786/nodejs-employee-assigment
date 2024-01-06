import { ObjectId } from "bson"

export type MarketingChannels = "Newspapers" | "TV" | "GoogleAds"

export type Employee = {
  _id: ObjectId,
  name: string,
  type: "marketing" | "sales"
}

// The Assignment created when an idle employee is assigned to a product and channel.
// The employee is idle when there is no related Assignment.
// One employee should only have one assignmnet at a time.
export type Assignment = {
  _id: ObjectId,
  employeeId: ObjectId,
  // productId: string,
  channel?: MarketingChannels
}

// The product refers to a product that the company sells
// One product is seeded into the database.
export type Product = {
  // MongoDB ObjectId type
  _id: ObjectId
  marketingPoints: Record<MarketingChannels, number>,
}