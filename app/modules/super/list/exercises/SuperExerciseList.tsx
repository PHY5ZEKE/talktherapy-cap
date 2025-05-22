import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const data = [
  {
    img_url:
      "https://i.pinimg.com/736x/67/bf/2b/67bf2bb059d1828e2f230d28daa6f1af.jpg",
    title: "Understanding Mental Health",
    description:
      "A guide to recognizing, managing, and supporting mental well-being.",
    category: "Health",
  },
  {
    img_url: "",
    title: "Effective Team Building Strategies",
    description: "Learn how to build stronger, more collaborative teams.",
    category: "Business",
  },
  {
    img_url:
      "https://i.pinimg.com/736x/3e/b4/b7/3eb4b7a4be0358397f0ac080db3be66f.jpg",
    title: "Top 10 Frontend Development Tools",
    description:
      "Enhance your productivity with these essential frontend tools. Enhance your productivity with these essential frontend tools. Enhance your productivity with these essential frontend tools. Enhance your productivity with these essential frontend tools. Enhance your productivity with these essential frontend tools. Enhance your productivity with these essential frontend tools.",
    category: "Technology",
  },
  {
    img_url:
      "https://i.pinimg.com/736x/47/c8/0f/47c80f226b72fc3f81a14fdc2b3c1bba.jpg",
    title: "The Power of Mindfulness",
    description:
      "Practical tips to incorporate mindfulness into your daily routine. Gago nag uupdate ba ako? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Isa pa lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Isa pa",
    category: "Wellness",
  },
  {
    img_url:
      "https://i.pinimg.com/736x/ef/f4/63/eff4638c5f39de96f910362ebfa7f087.jpg",
    title: "Beginner's Guide to Investing",
    description:
      "Start your journey to financial freedom with these simple steps.",
    category: "Finance",
  },
];

const ExerciseCard = ({
  img_url,
  title,
  description,
  category,
}: {
  img_url?: string;
  title: string;
  description: string;
  category: string;
}) => {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          height: "100%",
        }}
      >
        {img_url ? (
          <CardMedia
            component="img"
            image={img_url}
            alt={title}
            sx={{ objectFit: "cover", height: "180px" }}
          />
        ) : (
          <CardMedia
            component="img"
            height="100"
            image="https://i.pinimg.com/736x/36/e2/75/36e275e0148c1ef01e77f07abed5705a.jpg"
            sx={{ objectFit: "cover", height: "180px" }}
            alt={title}
          />
        )}

        <Stack flex={1} justifyContent="space-between">
          <CardContent>
            <Typography noWrap gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                maxHeight: "77px",
                whiteSpace: "normal",
              }}
              noWrap={true}
            >
              {description}
            </Typography>
          </CardContent>

          <CardActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              padding: 2,
            }}
          >
            <Button size="small">{category}</Button>
            <Stack direction="row" spacing={1} sx={{ marginLeft: "auto" }}>
              <Button size="small" variant="contained">
                Edit
              </Button>
              <Button size="small" variant="outlined">
                Delete
              </Button>
            </Stack>
          </CardActions>
        </Stack>
      </Card>
    </Grid>
  );
};

export default function SuperExerciseList() {
  return (
    <>
      <Card sx={{ backgroundColor: "white", padding: 2 }}>
        <p>TODO: Search, Filter</p>
        <Grid container spacing={2}>
          {data.map((exercise, index) => (
            <ExerciseCard
              key={index}
              img_url={exercise.img_url}
              title={exercise.title}
              description={exercise.description}
              category={exercise.category}
            />
          ))}
        </Grid>

        <p>TODO: Pagination</p>
      </Card>
    </>
  );
}
