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
];
