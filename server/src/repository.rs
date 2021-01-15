use sqlx::PgPool;

use crate::Food;

pub async fn get_foods(pool: &PgPool) -> anyhow::Result<Vec<Food>> {
    let foods = sqlx::query_as("SELECT id, name FROM foods;")
        .fetch_all(pool)
        .await?;

    Ok(foods)
}
