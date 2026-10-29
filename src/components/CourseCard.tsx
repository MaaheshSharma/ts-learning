type CourseCardProps = {
  courseName: string;
  totalLessons: number;
  duration: string;
};

function CourseCard({ courseName, totalLessons, duration }: CourseCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {courseName}
      </h2>

      <hr className="my-6 border-slate-200" />

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Lessons</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {totalLessons}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Duration</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{duration}</p>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
