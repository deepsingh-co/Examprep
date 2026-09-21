const StatCard = ({ icon: Icon, label, value, color = "text-primary", bg = "bg-primary-light" }) => {
  return (
    <div className="surface-card p-5 flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={color} size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;