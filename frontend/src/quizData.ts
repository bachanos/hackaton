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
