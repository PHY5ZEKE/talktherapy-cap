import { useEffect } from 'react';

const useLoadTensorFlow = (shouldLoad) => {
  useEffect(() => {
    if (shouldLoad) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [shouldLoad]);
};

export default useLoadTensorFlow;