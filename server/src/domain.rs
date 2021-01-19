use crate::serde_date;
use serde::{Deserialize, Serialize};
use time::Date;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewFood {
    pub name: String,
    #[serde(with = "serde_date")]
    pub best_before_date: Date,
}

#[derive(Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Food {
    pub id: i32,
    pub name: String,
    #[serde(with = "serde_date")]
    pub best_before_date: Date,
}
