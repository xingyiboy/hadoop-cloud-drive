import NavBar from "./components/NavBar";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import FoodsCategory from "./components/FoodsCategory";

import { useDispatch, useSelector } from "react-redux";
import { fetchFoodList } from "./store/modules/takeaway";
import { useEffect } from "react";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchFoodList());
  }, [dispatch]);

  const { foodsList, activeIndex } = useSelector((store) => store.foods);
  console.log(foodsList);

  return <div className="home">test</div>;
};

export default App;
