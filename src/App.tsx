import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import SpaceCatList from "./pages/SpaceCat/SpaceCatList";
import SpaceCatView from "./pages/SpaceCat/SpaceCatView";

import SpaceCatForm from "./pages/SpaceCat/SpaceCatForm";
import Otp from "./pages/AuthPages/Otp";
import SubCategoryList from "./pages/SpaceSubCat/SubCategoryList";
import SubCategoryForm from "./pages/SpaceSubCat/SubCategoryForm";
import EcoTrailList from "./pages/EcoTrail/EcoTrailList";
import EcoTrailForm from "./pages/EcoTrail/EcoTrailForm";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {localStorage.getItem('token') && localStorage.getItem('token') != "undefiend" ?
            <>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>


                <Route index path="/" element={<Home />} />
                <Route path="/dashboard" element={<Home />} />

                {/* space Category */}
                <Route path="/space-category" element={<SpaceCatList />} />
                <Route path="/space-category/create" element={<SpaceCatForm />} />
                <Route path="/space-category/view/:id" element={<SpaceCatView />} />
                <Route path="/space-category/edit/:id" element={<SpaceCatForm />} />



                {/* space Sub Category */}
                <Route path="/space-sub-category" element={<SubCategoryList />} />
                <Route path="/space-sub-category/create" element={<SubCategoryForm />} />
                <Route path="/space-sub-category/edit/:id" element={<SubCategoryForm />} />


                {/* EcoTrail */}
                <Route path="/eco-trail" element={<EcoTrailList />} />
                <Route path="/eco-trail/create" element={<EcoTrailForm />} />
                <Route path="/eco-trail/edit/:id" element={<EcoTrailForm />} />




                {/* Others Page */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />

                {/* Forms */}
                <Route path="/form-elements" element={<FormElements />} />

                {/* Tables */}
                <Route path="/basic-tables" element={<BasicTables />} />

                {/* Ui Elements */}
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />

                {/* Charts */}
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
                <Route path="*" element={<NotFound />} />



              </Route>
            </> :
            <>

              {/* Auth Layout */}
              <Route index path="/" element={<SignIn />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/otp/:email" element={<Otp />} />
              <Route path="*" element={<NotFound />} />
            </>
          }

          {/* Fallback Route */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Router >
    </>
  );
}
