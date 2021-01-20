use crate::domain::{Food, NewFood};
use sqlx::PgPool;

#[derive(sqlx::FromRow)]
struct Id(i32);

pub async fn get_foods(pool: &PgPool) -> anyhow::Result<Vec<Food>> {
    let foods = sqlx::query_as("SELECT id, name, best_before_date FROM foods;")
        .fetch_all(pool)
        .await?;

    Ok(foods)
}

pub async fn create_food(pool: &PgPool, food: NewFood) -> anyhow::Result<Food> {
    let Id(id) = sqlx::query_as(
        "INSERT INTO foods ( name, best_before_date ) VALUES ( $1, $2 ) RETURNING id;",
    )
    .bind(&food.name)
    .bind(&food.best_before_date)
    .fetch_one(pool)
    .await?;

    Ok(Food {
        id,
        name: food.name,
        best_before_date: food.best_before_date,
    })
}

pub async fn delete_food(pool: &PgPool, id: i32) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM foods WHERE id = $1;")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}
