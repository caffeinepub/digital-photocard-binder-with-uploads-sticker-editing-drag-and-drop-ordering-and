export default function BinderRingsOverlay() {
  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-64 pointer-events-none z-20">
      <img
        src="/assets/generated/binder-rings-light.dim_1200x400.png"
        alt=""
        className="w-full h-full object-contain opacity-40"
      />
    </div>
  );
}
