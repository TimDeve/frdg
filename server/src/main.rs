mod repository;

use std::env;

use sqlx::postgres::PgPool;
use tide::prelude::*;
use tide::{Body, Request, Server};

#[derive(Clone)]
struct Context {
    pool: PgPool,
}

#[derive(Debug, Deserialize)]
pub struct NewFood {
    name: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Food {
    id: i64,
    name: String,
}

#[derive(Debug, Serialize)]
struct GetFoodResponse {
    foods: Vec<Food>,
}

#[async_std::main]
async fn main() -> tide::Result<()> {
    let pool = PgPool::connect(&env::var("DATABASE_URL")?).await?;

    sqlx::migrate!().run(&pool).await?;

    let mut app = Server::with_state(Context { pool });

    app.at("/api/foods").get(get_foods);
    app.at("/api/foods").post(create_food);

    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

async fn get_foods(req: Request<Context>) -> tide::Result<Body> {
    let foods = repository::get_foods(&req.state().pool).await?;
    Body::from_json(&GetFoodResponse { foods })
}

async fn create_food(req: Request<Context>) -> tide::Result<Body> {
    let foods = repository::get_foods(&req.state().pool).await?;
    Body::from_json(&GetFoodResponse { foods })
}
