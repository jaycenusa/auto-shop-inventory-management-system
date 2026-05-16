module.exports = (api) => {
  const isDev = api.env('development')

  return {
    presets: [
      '@babel/preset-env',
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: [isDev && 'react-refresh/babel'].filter(Boolean),
  }
}
