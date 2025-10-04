export interface Answer {
  id: number;
  text: string;
  imageUrl: string;
}

export interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
  correctAnswerId: number;
  explanation: string;
}

export const quizQuestions: Question[] = [
  {
    id: 1,
    questionText: '¿Cuál de estos planetas es conocido como el "Planeta Rojo"?',
    answers: [
      {
        id: 1,
        text: 'Júpiter',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/800px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
      },
      {
        id: 2,
        text: 'Marte',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg',
      },
      {
        id: 3,
        text: 'Saturno',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/800px-Saturn_during_Equinox.jpg',
      },
      {
        id: 4,
        text: 'Venus',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/800px-Venus-real_color.jpg',
      },
    ],
    correctAnswerId: 2,
    explanation:
      'Marte es conocido como el "Planeta Rojo" debido a la gran cantidad de óxido de hierro en su superficie, que le da su característico color rojizo.',
  },
  {
    id: 2,
    questionText: '¿Cuál es el objeto más grande del cinturón de asteroides?',
    answers: [
      {
        id: 1,
        text: 'Vesta',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vesta_in_true_color.jpg/800px-Vesta_in_true_color.jpg',
      },
      {
        id: 2,
        text: 'Pallas',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Pallas-HST-2007.jpg/320px-Pallas-HST-2007.jpg',
      },
      {
        id: 3,
        text: 'Ceres',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ceres_-_RC3_-_Haulani_Crater_%2822359932521%29.jpg/800px-Ceres_-_RC3_-_Haulani_Crater_%2822359932521%29.jpg',
      },
      {
        id: 4,
        text: 'Hygiea',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Hygiea_map.png/320px-Hygiea_map.png',
      },
    ],
    correctAnswerId: 3,
    explanation:
      'Ceres es el objeto más grande del cinturón de asteroides y el único planeta enano situado en el sistema solar interior.',
  },
  {
    id: 3,
    questionText: '¿Qué telescopio espacial es el sucesor del Hubble?',
    answers: [
      {
        id: 1,
        text: 'Spitzer',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Spitzer_Space_Telescope_in_space.jpg/800px-Spitzer_Space_Telescope_in_space.jpg',
      },
      {
        id: 2,
        text: 'Kepler',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Kepler_space_telescope_model.png/800px-Kepler_space_telescope_model.png',
      },
      {
        id: 3,
        text: 'Chandra',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Chandra.jpg/800px-Chandra.jpg',
      },
      {
        id: 4,
        text: 'James Webb',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/JWST_spacecraft_model_2.jpg/800px-JWST_spacecraft_model_2.jpg',
      },
    ],
    correctAnswerId: 4,
    explanation:
      'El Telescopio Espacial James Webb (JWST) es el sucesor del Hubble, diseñado para ver el universo en infrarrojo y estudiar las primeras galaxias.',
  },
];

// Nueva interfaz para quiz con imagen en la pregunta y respuestas en texto
export interface ImageQuestion {
  id: number;
  question: string;
  imageUrl: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
}

export const imageQuizQuestions: ImageQuestion[] = [
  {
    id: 1,
    question:
      'Esta imagen del Telescopio Espacial James Webb muestra los "Pilares de la Creación". ¿En qué nebulosa se encuentran?',
    imageUrl: 'https://stsci-opo.org/STScI-01G8GAB346P5V1P3X32S2BFJ2C.png',
    answers: [
      'Nebulosa de Orión',
      'Nebulosa del Águila',
      'Nebulosa del Cangrejo',
      'Nebulosa de la Tarántula',
    ],
    correctAnswer: 1,
    explanation:
      'Los Pilares de la Creación son una pequeña región dentro de la vasta Nebulosa del Águila, a unos 6,500 años luz de distancia.',
  },
  {
    id: 2,
    question:
      'La galaxia en esta imagen, conocida como "Rueda de Carro", es un ejemplo de un tipo raro de galaxia. ¿Cuál es?',
    imageUrl: 'https://stsci-opo.org/STScI-01G695Q1K1J1V4PE19T4V32D4B.png',
    answers: [
      'Galaxia espiral',
      'Galaxia elíptica',
      'Galaxia lenticular',
      'Galaxia anular',
    ],
    correctAnswer: 3,
    explanation:
      'La Galaxia Rueda de Carro es una galaxia anular, formada por una colisión frontal con otra galaxia más pequeña hace millones de años.',
  },
];

// Interfaz unificada para ambos tipos de preguntas
export interface UnifiedQuestion {
  id: number;
  type: 'text-with-images' | 'image-with-text';
  questionText: string;
  questionImageUrl?: string; // Solo para tipo 'image-with-text'
  answers: Answer[] | string[]; // Answer[] para 'text-with-images', string[] para 'image-with-text'
  correctAnswerId?: number; // Para 'text-with-images'
  correctAnswer?: number; // Para 'image-with-text'
  explanation: string;
}

// Array unificado que mezcla ambos tipos de preguntas
export const unifiedQuizQuestions: UnifiedQuestion[] = [
  // Pregunta tipo imagen con respuestas texto (ImageQuiz)
  {
    id: 1,
    type: 'image-with-text',
    questionText:
      'Esta imagen del Telescopio Espacial James Webb muestra los "Pilares de la Creación". ¿En qué nebulosa se encuentran?',
    questionImageUrl:
      'https://stsci-opo.org/STScI-01G8GAB346P5V1P3X32S2BFJ2C.png',
    answers: [
      'Nebulosa de Orión',
      'Nebulosa del Águila',
      'Nebulosa del Cangrejo',
      'Nebulosa de la Tarántula',
    ],
    correctAnswer: 1,
    explanation:
      'Los Pilares de la Creación son una pequeña región dentro de la vasta Nebulosa del Águila, a unos 6,500 años luz de distancia.',
  },
  // Pregunta tipo texto con respuestas imagen (Quiz original)
  {
    id: 2,
    type: 'text-with-images',
    questionText: '¿Cuál de estos planetas es conocido como el "Planeta Rojo"?',
    answers: [
      {
        id: 1,
        text: 'Júpiter',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/800px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
      },
      {
        id: 2,
        text: 'Marte',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg',
      },
      {
        id: 3,
        text: 'Saturno',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/800px-Saturn_during_Equinox.jpg',
      },
      {
        id: 4,
        text: 'Venus',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/800px-Venus-real_color.jpg',
      },
    ],
    correctAnswerId: 2,
    explanation:
      'Marte es conocido como el "Planeta Rojo" debido a la gran cantidad de óxido de hierro en su superficie, que le da su característico color rojizo.',
  },
  // Otra pregunta tipo imagen con respuestas texto
  {
    id: 3,
    type: 'image-with-text',
    questionText:
      'La galaxia en esta imagen, conocida como "Rueda de Carro", es un ejemplo de un tipo raro de galaxia. ¿Cuál es?',
    questionImageUrl:
      'https://stsci-opo.org/STScI-01G695Q1K1J1V4PE19T4V32D4B.png',
    answers: [
      'Galaxia espiral',
      'Galaxia elíptica',
      'Galaxia lenticular',
      'Galaxia anular',
    ],
    correctAnswer: 3,
    explanation:
      'La Galaxia Rueda de Carro es una galaxia anular, formada por una colisión frontal con otra galaxia más pequeña hace millones de años.',
  },
  // Pregunta tipo texto con respuestas imagen
  {
    id: 4,
    type: 'text-with-images',
    questionText: '¿Cuál es el objeto más grande del cinturón de asteroides?',
    answers: [
      {
        id: 1,
        text: 'Vesta',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vesta_in_true_color.jpg/800px-Vesta_in_true_color.jpg',
      },
      {
        id: 2,
        text: 'Pallas',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Pallas-HST-2007.jpg/320px-Pallas-HST-2007.jpg',
      },
      {
        id: 3,
        text: 'Ceres',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ceres_-_RC3_-_Haulani_Crater_%2822359932521%29.jpg/800px-Ceres_-_RC3_-_Haulani_Crater_%2822359932521%29.jpg',
      },
      {
        id: 4,
        text: 'Hygiea',
        imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Hygiea_map.png/320px-Hygiea_map.png',
      },
    ],
    correctAnswerId: 3,
    explanation:
      'Ceres es el objeto más grande del cinturón de asteroides y el único planeta enano situado en el sistema solar interior.',
  },
];
