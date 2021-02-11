import { Dayjs } from "dayjs";

export interface Food {
  id: number
  name: string
  bestBeforeDate: Dayjs
}

export interface NewFood {
  name: string
  bestBeforeDate: Dayjs 
}
