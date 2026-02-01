import { useParams } from 'react-router-dom';

export default function TitleDetail() {
  const { type, id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Title Detail</h1>
      <p className="text-gray-400">Type: {type}, ID: {id}</p>
    </div>
  );
}
