type Props = {
  params: { sessionId: string };
};

const OccupiedTeacherPage = ({ params }: Props) => {
  return <div>{params.sessionId}</div>;
};

export default OccupiedTeacherPage;
