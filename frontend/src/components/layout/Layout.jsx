import BottomTabBar from './BottomTabBar'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <BottomTabBar />
    </>
  )
}
