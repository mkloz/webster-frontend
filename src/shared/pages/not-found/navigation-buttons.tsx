import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';

export const NavigationButtons = () => {
  const nav = useNavigate();

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
      <Button onClick={() => nav(-1)} variant="outline" size="lg" className="shadow-lg">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go Back
      </Button>
      <Button onClick={() => nav('/')} variant="default" size="lg" className="shadow-lg opacity-80 hover:opacity-100">
        <Home className="mr-2 h-4 w-4" />
        Go Home
      </Button>
    </div>
  );
};
