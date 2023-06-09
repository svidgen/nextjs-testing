export default function Page({ params }: { params: { thread: string }}) {
    return <div>Thread: {params.thread}</div>;
  }