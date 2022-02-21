export const styleUtils = {
  font: (name) => ({
    fontSize: name,
    fontWeight: name,
    lineHeight: name,
  }),
  paddingHori: (value) => ({
    paddingLeft: value,
    paddingRight: value,
  }),
  paddingVert: (value) => ({
    paddingTop: value,
    paddingBottom: value,
  }),
  marginHori: (value) => ({
    marginLeft: value,
    marginRight: value,
  }),
  marginVert: (value) => ({
    marginTop: value,
    marginBottom: value,
  }),
  size: (value) => ({
    width: value,
    height: value,
  }),
  userSelect: (value) => ({
    WebkitUserSelect: value,
    userSelect: value,
  }),
  appearance: (value) => ({
    WebkitAppearance: value,
    appearance: value,
  }),
  backgroundClip: (value) => ({
    WebkitBackgroundClip: value,
    backgroundClip: value,
  }),
};
