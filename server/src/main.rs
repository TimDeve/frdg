mod repository;

use std::env;

use anyhow::{Context, Result};
use sqlx::postgres::PgPool;
use tide::prelude::*;
use tide::{Body, Request, Server};

#[derive(Clone)]
struct AppContext {
    pool: PgPool,
}

#[derive(Deserialize)]
pub struct NewFood {
    name: String,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Food {
    id: i32,
    name: String,
}

#[derive(Serialize)]
struct GetFoodResponse {
    foods: Vec<Food>,
}

#[async_std::main]
async fn main() -> Result<()> {
    let database_url =
        env::var("DATABASE_URL").context("DATABASE_URL env variable needs to be set")?;
    let pool = PgPool::connect(&database_url).await?;

    sqlx::migrate!().run(&pool).await?;

    tide::log::start();
    let mut app = Server::with_state(AppContext { pool });

    make_routes(&mut app);

    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

fn make_routes(app: &mut Server<AppContext>) {
    app.at("/api/v0/foods").get(get_foods);
    app.at("/api/v0/foods").post(create_food);
}

async fn get_foods(req: Request<AppContext>) -> tide::Result<Body> {
    let foods = repository::get_foods(&req.state().pool).await?;
    Body::from_json(&GetFoodResponse { foods })
}

async fn create_food(mut req: Request<AppContext>) -> tide::Result<Body> {
    let new_food: NewFood = req.body_json().await?;
    let created_food = repository::create_food(&req.state().pool, new_food).await?;
    Body::from_json(&created_food)
}

