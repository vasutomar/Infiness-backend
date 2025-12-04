const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_LOCAL_URI || 'mongodb+srv://Vasu:infi@infiness.ygyw1ce.mongodb.net/Infiness';
const dbName = process.env.DATABASE || 'Infiness';
const collectionName = "exercises";

const exercises = [{
  "muscleGroup": "chest",
  "title": "Barbell Bench Press",
  "description": "Compound chest press using barbell.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Incline Dumbbell Press",
  "description": "Press dumbbells on incline bench.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Decline Bench Press",
  "description": "Chest press on decline bench.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Push-Ups",
  "description": "Bodyweight chest pressing movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Variation",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Cable Chest Fly",
  "description": "Cable fly isolating chest muscles.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Dumbbell Chest Fly",
  "description": "Fly motion with dumbbells on bench.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Chest Press Machine",
  "description": "Machine-guided chest pressing motion.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Incline Bench Press",
  "description": "Barbell press on incline bench.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Dips",
  "description": "Chest and triceps bodyweight dip.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Added Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "chest",
  "title": "Pec Deck Machine",
  "description": "Machine chest fly for isolation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Deadlift",
  "description": "Full posterior chain strength lift.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Pull-Ups",
  "description": "Bodyweight pull targeting lats.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Added Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Lat Pulldown",
  "description": "Cable pull targeting lats.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Barbell Bent-Over Row",
  "description": "Row barbell to torso for back.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Seated Cable Row",
  "description": "Seated cable pull for mid-back.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "T-Bar Row",
  "description": "Heavy row variation for thickness.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Dumbbell Row",
  "description": "Single-arm dumbbell back row.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Back Extension",
  "description": "Lower-back extension exercise.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Hold Time (sec)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Face Pull",
  "description": "Rear delt and trap cable pull.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "back",
  "title": "Shrugs",
  "description": "Trap-building shoulder shrug movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "title": "Overhead Barbell Press",
  "description": "Vertical barbell shoulder press.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Seated Dumbbell Press",
  "description": "Seated dumbbell shoulder press.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Lateral Raise",
  "description": "Side raise targeting delts.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Front Raise",
  "description": "Raise weight forward for delts.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Rear Delt Fly",
  "description": "Rear shoulder fly movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Arnold Press",
  "description": "Rotational dumbbell press variation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Upright Row",
  "description": "Vertical pull for traps and delts.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Machine Shoulder Press",
  "description": "Machine-guided overhead press.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Cable Lateral Raise",
  "description": "Cable version of side raise.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "title": "Handstand Push-Ups",
  "description": "Bodyweight vertical pressing exercise.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Assistance",
    "value": 0
  },
  "muscleGroup": "shoulders"
},{
  "muscleGroup": "arms",
  "title": "Barbell Bicep Curl",
  "description": "Barbell curl for biceps.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Dumbbell Curl",
  "description": "Curl dumbbells for biceps.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Hammer Curl",
  "description": "Neutral grip curl variation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Preacher Curl",
  "description": "Supported curl for isolation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Tricep Rope Pushdown",
  "description": "Cable pushdown for triceps.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Tricep Dips",
  "description": "Bodyweight tricep dip exercise.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Added Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Skull Crushers",
  "description": "Lying barbell tricep extension.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Close Grip Bench Press",
  "description": "Narrow grip press for triceps.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Cable Curl",
  "description": "Cable-based bicep curl motion.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "arms",
  "title": "Overhead Tricep Extension",
  "description": "Dumbbell overhead tricep stretch.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Back Squats",
  "description": "Barbell squat for legs.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Front Squats",
  "description": "Front-loaded squat variation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Lunges",
  "description": "Alternating stepping leg movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Leg Press",
  "description": "Machine leg pressing movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Romanian Deadlift",
  "description": "Hamstring-focused hip hinge.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Leg Curl Machine",
  "description": "Machine curl for hamstrings.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Leg Extension Machine",
  "description": "Machine quad extension motion.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Calf Raise",
  "description": "Raise heels for calves.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Bulgarian Split Squats",
  "description": "Elevated rear-leg squat variation.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "legs",
  "title": "Hip Thrust",
  "description": "Glute-focused hip extension lift.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Crunches",
  "description": "Basic abdominal crunch movement.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Duration (sec)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Plank",
  "description": "Static core stability hold.",
  "primaryQualifier": {
    "label": "Duration (sec)",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Rounds",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Hanging Leg Raise",
  "description": "Leg lift while hanging.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Added Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Russian Twists",
  "description": "Twisting core rotation exercise.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Mountain Climbers",
  "description": "Fast alternating knee drive.",
  "primaryQualifier": {
    "label": "Duration (sec)",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Repetitions",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Bicycle Crunch",
  "description": "Alternating elbow-to-knee crunch.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Time (sec)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Toe Touches",
  "description": "Reach to touch toes upward.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Sets",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Side Plank",
  "description": "Side core stability hold.",
  "primaryQualifier": {
    "label": "Duration (sec)",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Side",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Cable Woodchoppers",
  "description": "Rotational cable chop motion.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Weight (kg)",
    "value": 0
  }
},{
  "muscleGroup": "abs",
  "title": "Ab Wheel Rollouts",
  "description": "Wheel rollout for core strength.",
  "primaryQualifier": {
    "label": "Repetitions",
    "value": 0
  },
  "secondaryQualifier": {
    "label": "Distance",
    "value": 0
  }
}];

async function runMigration() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log("Inserting migration data...");
    const result = await collection.insertMany(exercises);

    console.log(`Migration complete. Inserted ${result.insertedCount} items.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

runMigration();
