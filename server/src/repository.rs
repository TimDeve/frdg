use crate::domain::{Food, NewFood};
use sqlx::{Executor, Postgres};

pub async fn get_foods<'a, E>(exec: E) -> anyhow::Result<Vec<Food>>
where
    E: 'a + Executor<'a, Database = Postgres>,
{
    let foods = sqlx::query_as(
        "SELECT id, name, best_before_date
         FROM foods
         ORDER BY best_before_date DESC",
    )
    .fetch_all(exec)
    .await?;

    Ok(foods)
}

pub async fn create_food<'a, E>(exec: E, food: NewFood) -> anyhow::Result<Food>
where
    E: 'a + Executor<'a, Database = Postgres>,
{
    let created_food = sqlx::query_as(
        "INSERT INTO foods ( name, best_before_date )
         VALUES ( $1, $2 )
         RETURNING id, name, best_before_date",
    )
    .bind(&food.name)
    .bind(&food.best_before_date)
    .fetch_one(exec)
    .await?;

    Ok(created_food)
}

pub async fn delete_food<'a, E>(exec: E, id: i32) -> anyhow::Result<()>
where
    E: 'a + Executor<'a, Database = Postgres>,
{
    sqlx::query("DELETE FROM foods WHERE id = $1")
        .bind(id)
        .execute(exec)
        .await?;

    Ok(())
}
