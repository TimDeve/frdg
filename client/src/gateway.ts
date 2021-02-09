import { Food, NewFood } from "./domain"

interface GetFoodsResponse {
  foods: Food[]
}

export async function getFoods(): Promise<Food[]> {
  try {
    const res = await fetch("/api/v0/foods")
    if (!res.ok) throw new Error("Failed to fetch foods")
    const json: GetFoodsResponse = await res.json()
    return json.foods
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function createFood({
  name,
  bestBeforeDate,
}: NewFood): Promise<void> {
  try {
    const res = await fetch("/api/v0/foods", {
      method: "POST",
      body: JSON.stringify({
        name,
        bestBeforeDate,
      }),
    })
    if (!res.ok) throw new Error("Failed to create food")
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function deleteFood(foodId: number): Promise<void> {
  try {
    const res = await fetch(`/api/v0/foods/${foodId}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete food")
  } catch (e) {
    console.error(e)
    throw e
  }
}
