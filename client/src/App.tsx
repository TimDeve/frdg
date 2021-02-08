import React, { useEffect, useRef, useState } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import {
  AppBar,
  Container,
  CssBaseline,
  Card,
  Toolbar,
  Typography,
  CardContent,
  CardActions,
  Button,
} from "@material-ui/core"

import { deleteFood, getFoods } from "./gateway"
import { Food } from "./domain"

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#222",
    },
    secondary: {
      main: "#f50057",
    },
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Page />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function Page() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography component="p" variant="h6">
            FRDG
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <FoodList />
      </Container>
    </>
  )
}

function FoodList() {
  const { isLoading, error, data } = useQuery(getFoods.name, getFoods)

  if (isLoading) {
    return <Loading />
  }

  if (error || !data) {
    return <>"Oops, something went wrong!"</>
  }

  return (
    <>
      {data.map((food) => (
        <FoodItem key={food.id} {...food} />
      ))}
    </>
  )
}

function FoodItem({ name, bestBeforeDate, id }: Food) {
  const { mutateAsync: delFood } = useMutation(deleteFood, {
    onSuccess: () => {
      queryClient.invalidateQueries(getFoods.name)
    },
  })

  return (
    <Card style={{ marginTop: "14px", marginBottom: "14px" }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Best Before: {bestBeforeDate}
        </Typography>
        <Typography variant="h5" component="p">
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => delFood(id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

function Loading() {
  const timeoutRef = useRef<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }
  }, [])

  return <>{isVisible && "Loading..."}</>
}

export default App
