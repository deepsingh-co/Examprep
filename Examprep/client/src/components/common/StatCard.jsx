const StatCard = ({ icon: Icon, label, value, color = "text-primary", bg = "bg-primary/10" }) => {
  return (
    <div className="bg-dark-800 border border-white/5 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;