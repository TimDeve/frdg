use std::{error::Error, fmt::Display};

use crate::domain::{Food, NewFood};
use crate::{repository, AppContext};
use serde::{Deserialize, Serialize};
use tide::{Body, Request, Response, Server, StatusCode};

pub fn init(app: &mut Server<AppContext>) {
    let mut foods_api = app.at("/api/v0/foods");
    foods_api.get(get_foods);
    foods_api.post(create_food);
    foods_api.at("/:id").delete(delete_food);
}

#[derive(Deserialize)]
struct GetFoodQueryParams {
    limit: Option<u32>,
}

#[derive(Serialize)]
struct GetFoodResponse {
    foods: Vec<Food>,
}

async fn get_foods(req: Request<AppContext>) -> tide::Result<Body> {
    let query: GetFoodQueryParams = req.query()?;
    let limit = query.limit.unwrap_or(500);
    let foods = repository::get_foods(&req.state().pool, limit).await?;
    Body::from_json(&GetFoodResponse { foods })
}

async fn create_food(mut req: Request<AppContext>) -> tide::Result<Body> {
    let new_food: NewFood = req.body_json().await?;
    let created_food = repository::create_food(&req.state().pool, new_food).await?;
    Body::from_json(&created_food)
}

async fn delete_food(req: Request<AppContext>) -> tide::Result<Response> {
    let food_id = parse_param(&req, "id")?;
    repository::delete_food(&req.state().pool, food_id).await?;
    Ok(Response::new(StatusCode::NoContent))
}

fn parse_param<T>(req: &Request<AppContext>, param: &str) -> Result<T, tide::Error>
where
    T: std::str::FromStr,
    <T as std::str::FromStr>::Err: Display + Sync + Send + Error + 'static,
{
    req.param(param)?.parse().map_err(|err| {
        tide::Error::new(
            StatusCode::BadRequest,
            anyhow::Error::new(err).context(format!("Failed to parse url param '{}'", param)),
        )
    })
}
