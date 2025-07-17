import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

export default function TestToastDemo() {
  const toast = useToast();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Toast Demo</h1>

      <div className="grid gap-4 max-w-md">
        <Button
          onClick={() =>
            toast.success('Success!', {
              description: 'Your changes have been saved successfully.',
            })
          }
          className="bg-green-600 hover:bg-green-700"
        >
          Show Success Toast
        </Button>

        <Button
          onClick={() =>
            toast.error('Error!', {
              description: 'Something went wrong. Please try again.',
            })
          }
          variant="destructive"
        >
          Show Error Toast
        </Button>

        <Button
          onClick={() =>
            toast.warning('Warning!', {
              description: 'This action cannot be undone.',
            })
          }
          className="bg-amber-600 hover:bg-amber-700"
        >
          Show Warning Toast
        </Button>

        <Button
          onClick={() =>
            toast.info('Info', {
              description: "Here's some helpful information for you.",
            })
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          Show Info Toast
        </Button>

        <Button
          onClick={() =>
            toast.show({
              title: 'Default Toast',
              description: 'This is a default toast notification.',
            })
          }
          variant="outline"
        >
          Show Default Toast
        </Button>

        <Button
          onClick={() => {
            toast.success('Quick notification');
            setTimeout(() => toast.error('An error occurred'), 1000);
            setTimeout(() => toast.info('Processing complete'), 2000);
          }}
          variant="secondary"
        >
          Show Multiple Toasts
        </Button>
      </div>
    </div>
  );
}
