use sqlx::PgPool;

use crate::{Food, NewFood};

#[derive(sqlx::FromRow)]
struct Id(i32);

pub async fn get_foods(pool: &PgPool) -> anyhow::Result<Vec<Food>> {
    let foods = sqlx::query_as("SELECT id, name FROM foods;")
        .fetch_all(pool)
        .await?;

    Ok(foods)
}

pub async fn create_food(pool: &PgPool, food: NewFood) -> anyhow::Result<Food> {
    let Id(id) = sqlx::query_as("INSERT INTO foods ( name ) VALUES ( $1 ) RETURNING id;")
        .bind(&food.name)
        .fetch_one(pool)
        .await?;

    Ok(Food {
        id,
        name: food.name,
    })
}

pub async fn delete_food(pool: &PgPool, id: i32) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM foods WHERE id = $1;")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}
