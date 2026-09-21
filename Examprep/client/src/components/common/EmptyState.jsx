const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
      {Icon && <Icon className="w-10 h-10 text-gray-500 mx-auto mb-4" />}
      <p className="text-gray-900 font-bold">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;