mod repository;

use std::env;

use anyhow::{Context, Result};
use sqlx::postgres::PgPool;
use tide::{prelude::*, Body, Request, Response, Server, StatusCode};

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
    let mut foods_api = app.at("/api/v0/foods");
    foods_api.get(get_foods);
    foods_api.post(create_food);
    foods_api.at("/:id").delete(delete_food);
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

async fn delete_food(req: Request<AppContext>) -> tide::Result<Response> {
    if let Ok(food_id) = req.param("id")?.parse::<i32>() {
        repository::delete_food(&req.state().pool, food_id).await?;
        Ok(Response::new(StatusCode::NoContent))
    } else {
        Ok(Response::new(StatusCode::BadRequest))
    }
}
