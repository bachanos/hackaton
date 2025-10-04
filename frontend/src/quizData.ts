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

// Nueva estructura para preguntas categorizadas por planta
export interface PlantQuizCategory {
  general: UnifiedQuestion[];
  romero: UnifiedQuestion[];
  menta: UnifiedQuestion[];
}

// Preguntas generales que se muestran para ambas plantas
const generalQuestions: UnifiedQuestion[] = [
  {
    id: 1,
    type: 'image-with-text',
    questionText:
      '¿Qué tipo de planta es la que aparece en esta imagen que acabas de capturar?',
    answers: ['Menta', 'Romero', 'Lavanda', 'Albahaca'],
    correctAnswer: 0, // Se ajustará dinámicamente según la planta detectada
    explanation:
      'La identificación correcta de plantas es fundamental para su cuidado adecuado.',
  },
  {
    id: 2,
    type: 'image-with-text',
    questionText:
      'Eres agricultor en Zaragoza y tienes delante el gráfico anual de humedad relativa, temperatura y precipitaciones. ¿Qué cultivo sería más adecuado plantar en estas condiciones?',
    questionImageUrl: '/images/zaragoza-climate-data.png',
    answers: [
      'Arroz (necesita suelos permanentemente inundados, alta humedad)',
      'Olivo (resistente a la sequía y altas temperaturas)',
      'Té (necesita clima húmedo y estable)',
      'Arándanos (prefieren climas frescos y húmedos todo el año)',
    ],
    correctAnswer: 1,
    explanation:
      'El olivo es un cultivo mediterráneo que se adapta muy bien a climas como el de Zaragoza, caracterizado por veranos secos y calurosos, baja humedad relativa y lluvias principalmente en otoño e invierno. Esto lo hace mucho más adecuado que cultivos que requieren humedad constante o temperaturas frescas.',
  },
  {
    id: 3,
    type: 'text-with-images',
    questionText:
      '¿Cuál es el factor más importante para el riego inteligente?',
    answers: [
      {
        id: 1,
        text: 'Solo la temperatura',
        imageUrl:
          'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop',
      },
      {
        id: 2,
        text: 'Humedad del suelo y clima',
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        text: 'Solo el tamaño de la maceta',
        imageUrl:
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      },
      {
        id: 4,
        text: 'Solo la estación del año',
        imageUrl:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      },
    ],
    correctAnswerId: 2,
    explanation:
      'El riego inteligente considera múltiples factores: humedad del suelo, temperatura, humedad ambiental y las necesidades específicas de cada planta.',
  },
];

// Preguntas específicas para romero
const romeroQuestions: UnifiedQuestion[] = [
  {
    id: 4,
    type: 'text-with-images',
    questionText: '¿Cuál es la característica más distintiva del romero?',
    answers: [
      {
        id: 1,
        text: 'Hojas grandes y redondas',
        imageUrl:
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop',
      },
      {
        id: 2,
        text: 'Hojas en forma de aguja y aromáticas',
        imageUrl:
          'https://images.unsplash.com/photo-1594736797933-d0e501ba2fe8?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        text: 'Flores muy grandes',
        imageUrl:
          'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      },
      {
        id: 4,
        text: 'Tallos muy gruesos',
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      },
    ],
    correctAnswerId: 2,
    explanation:
      'El romero se caracteriza por sus hojas en forma de aguja, muy aromáticas y de color verde oscuro.',
  },
  {
    id: 5,
    type: 'image-with-text',
    questionText: '¿Con qué frecuencia debe regarse el romero?',
    questionImageUrl:
      'https://images.unsplash.com/photo-1594736797933-d0e501ba2fe8?w=600&h=400&fit=crop',
    answers: [
      'Diariamente',
      'Cuando el suelo esté seco',
      'Solo en verano',
      'Una vez por semana siempre',
    ],
    correctAnswer: 1,
    explanation:
      'El romero prefiere suelos bien drenados y debe regarse solo cuando el suelo esté seco, ya que es resistente a la sequía.',
  },
];

// Preguntas específicas para menta
const mentaQuestions: UnifiedQuestion[] = [
  {
    id: 6,
    type: 'text-with-images',
    questionText: '¿Qué característica principal tiene la menta?',
    answers: [
      {
        id: 1,
        text: 'Hojas dentadas y aromáticas',
        imageUrl:
          'https://images.unsplash.com/photo-1628626617617-6ba8c9b5dc12?w=400&h=300&fit=crop',
      },
      {
        id: 2,
        text: 'Hojas lisas sin aroma',
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        text: 'Hojas muy pequeñas',
        imageUrl:
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      },
      {
        id: 4,
        text: 'Hojas de color rojo',
        imageUrl:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      },
    ],
    correctAnswerId: 1,
    explanation:
      'La menta se caracteriza por sus hojas dentadas, muy aromáticas y de color verde brillante.',
  },
  {
    id: 7,
    type: 'image-with-text',
    questionText: '¿Qué tipo de suelo prefiere la menta?',
    questionImageUrl:
      'https://images.unsplash.com/photo-1628626617617-6ba8c9b5dc12?w=600&h=400&fit=crop',
    answers: [
      'Suelo muy seco',
      'Suelo húmedo y bien drenado',
      'Solo arena',
      'Suelo arcilloso puro',
    ],
    correctAnswer: 1,
    explanation:
      'La menta prefiere suelos húmedos pero bien drenados, y necesita más agua que plantas como el romero.',
  },
];

// Función para obtener las preguntas según la planta detectada
export const getQuizQuestions = (detectedPlant?: string): UnifiedQuestion[] => {
  const specificQuestions =
    detectedPlant === 'romero'
      ? romeroQuestions
      : detectedPlant === 'menta'
      ? mentaQuestions
      : [];

  return [...generalQuestions, ...specificQuestions];
};
