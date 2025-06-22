import React from 'react';
import { QuizImageList, QuizImageUpload, QuizImageEdit } from '../../../components/QuizImages';

const QuizImagesPage = () => {
  return <QuizImageList />;
};

const QuizImageUploadPage = () => {
  return <QuizImageUpload />;
};

const QuizImageEditPage = () => {
  return <QuizImageEdit />;
};

export { QuizImagesPage, QuizImageUploadPage, QuizImageEditPage };
export default QuizImagesPage;
