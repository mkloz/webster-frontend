import type { FC, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import { Image } from '../../../shared/components/common/image';
import { AnimatedBackground } from '../components/common/shapes-animation';

export const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid min-h-screen-no-header lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-xs">
            {children}
            <Outlet />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:flex lg:items-center lg:justify-center">
        {/* <Logo /> */}
        <Image
          src="/party.png"
          alt="Calendar App Dashboard"
          wrapperClassName="absolute inset-0 w-full h-full z-0 blur-md backdrop-blur-md"
          className="w-full h-full object-cover object-center"
        />
        <AnimatedBackground />
      </div>
    </div>
  );
};
