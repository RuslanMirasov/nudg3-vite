import { Nudg3Logo } from '@/shared/components';
import { LoginForm } from '@/features/auth/components';

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <Nudg3Logo width={32} height={32} />
            <span className="text-lg font-semibold">
              NUDG
              <span className="text-purple-700">3</span>
              AI
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex flex-col items-center justify-center from-grey-900 via-grey-800 to-grey-900">
          <div className="flex flex-col items-center gap-6">
            <Nudg3Logo width={120} height={120} />
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-black dark:text-white">
                NUDG
                <span className="text-purple-600">3</span>
                <span className="text-black dark:text-white"> AI</span>
              </h1>
              <p className="text-grey-200 mt-2 text-lg">From zero to cited - make AI work for you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
