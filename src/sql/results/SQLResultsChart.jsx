// function useResizeHandler(ref) {
//   const [size, setSize] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     let resizeObserver;
//     const updateDimensions = () => {
//       const size = getDimensions(ref.current);
//       setSize(size);
//     };
//     updateDimensions();
//     window.onresize = updateDimensions;
//     const node = ref.current;
//     resizeObserver = new ResizeObserver(() => updateDimensions());
//     resizeObserver.observe(node);
//     return () => {
//       window.onresize = null;
//       resizeObserver.unobserve(node);
//     };
//   }, [ref]);
//   return size;
// }
