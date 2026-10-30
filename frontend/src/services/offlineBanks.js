// Comprehensive offline horror library bundled directly with client
export const OFFLINE_RIDDLES = [
  {
    id: "r1",
    category: "haunted",
    difficulty: "easy",
    question: "I have no flesh, no feathers, no scales, and no bone. Yet I have four fingers and a thumb of my own. In the dark cellar, you feel me slip over your hand...",
    answer: "glove",
    acceptableAnswers: ["glove", "a glove", "gloves", "leather glove"],
    hint: "You wear it to keep warm or hide your fingerprints.",
    lore: "The town's gravedigger left his leather glove beside the mausoleum gate."
  },
  {
    id: "r2",
    category: "carnival",
    difficulty: "medium",
    question: "I laugh when you laugh, I frown when you frown. I have no voice, but in the hall of mirrors, I mimic you upside down. Smash me, and seven years of dread will follow you around. What am I?",
    answer: "mirror",
    acceptableAnswers: ["mirror", "a mirror", "looking glass", "reflection"],
    hint: "Found in the carnival funhouse and above your bathroom sink.",
    lore: "The mirror in the funhouse doesn't reflect your face, but what stands right behind you."
  },
  {
    id: "r3",
    category: "mystery",
    difficulty: "hard",
    question: "I have keys that open no doors, space but no room to breathe. You can enter, but you can never leave. I click in the dead silence of the abandoned newspaper office. What am I?",
    answer: "keyboard",
    acceptableAnswers: ["keyboard", "a keyboard", "typewriter", "piano"],
    hint: "It has letters, numbers, and an 'Enter' key.",
    lore: "The last reporter in Derry typed a final warning before the sewer drains overflowed."
  },
  {
    id: "r4",
    category: "clown",
    difficulty: "medium",
    question: "I am light as air, filled with breath, yet tied by a thread to fate and death. When I float by your window, crimson and bright, you know you won't survive the night. What am I?",
    answer: "red balloon",
    acceptableAnswers: ["red balloon", "balloon", "a balloon", "a red balloon"],
    hint: "The signature emblem floating above the storm drain.",
    lore: "They float down here... and you'll float too."
  },
  {
    id: "r5",
    category: "ghost",
    difficulty: "hard",
    question: "The more you take from me, the larger I become. I dwell beneath the abandoned carnival stage, swallowing the brave and unwary. What am I?",
    answer: "hole",
    acceptableAnswers: ["hole", "a hole", "pit", "grave", "void"],
    hint: "Digging makes it bigger, not smaller.",
    lore: "A bottomless pit was uncovered beneath the Ferris wheel in 1988."
  },
  {
    id: "r6",
    category: "supernatural",
    difficulty: "easy",
    question: "I weep wax tears in the dark of night. Without my flame, you have no sight. The wind howls down the chimney to snuff out my life. What am I?",
    answer: "candle",
    acceptableAnswers: ["candle", "a candle", "taper", "wax candle"],
    hint: "Melts as it burns in the haunted chapel.",
    lore: "Candles placed on the altar of the Blackwood Estate flicker blue when spirits draw near."
  },
  {
    id: "r7",
    category: "psychological",
    difficulty: "nightmare",
    question: "I follow you in sunlight, flee you in the deep gloom. I mimic every gesture in the candlelit room. When midnight strikes, I step out from the wall. What am I?",
    answer: "shadow",
    acceptableAnswers: ["shadow", "a shadow", "my shadow", "the shadow"],
    hint: "Cast by your body against the light.",
    lore: "The clown's shadow detached itself from the wall and offered a twisted bow."
  },
  {
    id: "r8",
    category: "mansion",
    difficulty: "medium",
    question: "I have a heart that doesn't beat, two hands that never hold, and a face that never smiles as centuries turn cold. At midnight I chime with tolling bell. What am I?",
    answer: "clock",
    acceptableAnswers: ["clock", "a clock", "grandfather clock", "timepiece", "watch"],
    hint: "Ticks away the seconds in the manor hallway.",
    lore: "The grandfather clock stopped at 3:33 AM on the night the family vanished."
  }
];

export const OFFLINE_PUZZLES = [
  {
    id: "p1",
    type: "sequence",
    difficulty: "novice",
    title: "The Mortuary Lock Code",
    description: "Scratched into the brass dial of the iron gate are numbers. Determine the missing final digit to unlock the passage.",
    sequence: [3, 6, 12, 24, 48],
    target: "?",
    answer: "96",
    acceptableAnswers: ["96"],
    rule: "Each number is multiplied by 2.",
    hints: ["Examine the ratio between consecutive numbers.", "3 * 2 = 6, 6 * 2 = 12...", "Double the last number: 48 * 2."]
  },
  {
    id: "p2",
    type: "cipher",
    difficulty: "investigator",
    title: "The Caretaker's Rotated Scribble",
    description: "A bloody diary page has the word 'RUN' written in Caesar cipher (shifted forward by 3 letters). Decode this warning found on the wall: 'KHOOR'. What does it say?",
    cipherText: "KHOOR",
    shift: 3,
    answer: "HELLO",
    acceptableAnswers: ["HELLO", "hello"],
    rule: "Caesar cipher with shift 3.",
    hints: ["Shift each letter backward in the alphabet by 3 positions.", "K minus 3 is H. H minus 3 is E.", "It's the clown's mocking greeting."]
  },
  {
    id: "p3",
    type: "sequence",
    difficulty: "investigator",
    title: "The Toll of the Cursed Bells",
    description: "The cathedral bells toll at strange intervals: 2, 3, 5, 7, 11, 13, ?. What is the next bell count?",
    sequence: [2, 3, 5, 7, 11, 13],
    target: "?",
    answer: "17",
    acceptableAnswers: ["17"],
    rule: "Prime numbers in ascending order.",
    hints: ["These are not merely odd numbers; notice 2 is included.", "Numbers only divisible by 1 and themselves.", "The prime number immediately following 13."]
  },
  {
    id: "p4",
    type: "logic",
    difficulty: "cryptographer",
    title: "The Three Haunted Statues",
    description: "Three statues stand before the crypt: Jack (Jester), Crow (Raven), and Grim (Reaper). Only ONE statue tells the truth; the other two always lie.\n- Jester says: 'The key is inside the Reaper.'\n- Raven says: 'I do not have the key.'\n- Reaper says: 'The Jester is lying.'\nWho holds the key: JESTER, RAVEN, or REAPER?",
    answer: "RAVEN",
    acceptableAnswers: ["RAVEN", "raven", "the raven", "crow"],
    rule: "Raven holds the key.",
    hints: ["Assume each statue tells the truth one by one and test for contradictions.", "Notice the conflict between Jester and Reaper.", "If Reaper tells the truth, Raven's denial must be a lie."]
  },
  {
    id: "p5",
    type: "pattern",
    difficulty: "master",
    title: "The Alchemist's Pentagram Code",
    description: "An alchemical formula reads: S-U-L-P-H-U-R = 7, B-L-O-O-D = 5, S-E-W-E-R = 5. A lock requires the value of N-I-G-H-T-M-A-R-E. What number turns the tumbler?",
    answer: "9",
    acceptableAnswers: ["9", "nine"],
    rule: "The count of letters in the horror word.",
    hints: ["Count the letters in SULPHUR (7), BLOOD (5), SEWER (5).", "Apply the same logic to NIGHTMARE.", "Count: N-I-G-H-T-M-A-R-E."]
  }
];

export const OFFLINE_STORIES = [
  {
    id: "story_carnival_1",
    category: "Creepy carnival",
    intensity: "Chilling dread",
    title: "The Marionette's Carousel",
    paragraphs: [
      "The carnival had been condemned since the storm of 1974, yet as you pushed through the rusted wrought-iron turnstile, the faint scent of caramelized sugar and ozone lingered in the autumn mist. A solitary red balloon drifted through the skeletal ribs of the roller coaster, bobbing gently as if guided by an invisible tether.",
      "Ahead stood the Grand Carousel. Its carved wooden horses had peeled and cracked, their glass eyes glistening under the crescent moon. Then, without electricity or wind, a calliope organ wheezed to life. A jagged, dissonant waltz echoed across the midway. In the center mirror pedestal of the carousel, a figure in a silver-ruffed collar tilted its head.",
      "'Every ticket has a price, wanderer,' a melodic, raspy voice whispered from the speakers overhead. 'Will you take the reins, or step into the funhouse behind you?'"
    ],
    choices: [
      {
        id: "c1",
        text: "Mount the black carousel steed with the silver bridle.",
        outcome: "The wooden horse shudders beneath you, its hooves locking into the brass floor as the carousel accelerates to dizzying speed. Through the spinning lights, the clown steps onto the platform beside you, presenting an ornate brass key dripping with sewer water."
      },
      {
        id: "c2",
        text: "Flee toward the neon-flickering Funhouse of Mirrors.",
        outcome: "You plunge into the mirrored labyrinth. Everywhere you turn, hundredfold reflections of yourself stare back—except in every third pane, your reflection is smiling with rows of razor-sharp needle teeth."
      },
      {
        id: "c3",
        text: "Sever the red balloon's string with your pocketknife.",
        outcome: "The rubber membrane shrieks like a wounded animal as it pops. A thick crimson fog billows out, extinguishing the moonlight and revealing a hidden trapdoor leading beneath the carnival ground."
      }
    ]
  },
  {
    id: "story_haunted_house_1",
    category: "Haunted house",
    intensity: "Pure nightmare",
    title: "The Whispering Walls of Ravenscroft",
    paragraphs: [
      "The storm drove you through the double doors of Ravenscroft Manor. The lock engaged behind you with the resounding clunk of a tomb sealing. A grand grandfather clock struck thirteen, its pendulum motionless while the hands spun counterclockwise in an erratic frenzy.",
      "From the gallery overhead, portraits of the vanished Ravenscroft bloodline seemed to track your every step. Their painted pupils gleamed in the candelabra's dying flare. A damp draft brought the putrid smell of river silt and ancient decay.",
      "At the end of the corridor, three doors stood ajar: one weeping black water beneath the jamb, one humming with the high-pitched vibration of a tuning fork, and a trapdoor leading down into the wine cellar from which a young child's laugh echoed."
    ],
    choices: [
      {
        id: "c1",
        text: "Approach the door weeping black sewer water.",
        outcome: "The door swings open into an impossible flooded conduit. Resting upon a dry pedestal is a rusted music box playing the carnival overture."
      },
      {
        id: "c2",
        text: "Descend into the wine cellar toward the child's laughter.",
        outcome: "You descend into the gloom. A ring of children's shoes surrounds a glowing red balloon anchored to a storm drain. A chalk message on the stone wall reads: 'WE ALL FLOAT HERE'."
      },
      {
        id: "c3",
        text: "Search the library for the Master's diary before proceeding.",
        outcome: "Dust clouds choke you as you pull down the leather ledger. An entry dated yesterday is written in your own handwriting: 'I finally came back. The clown was waiting.'"
      }
    ]
  }
];
