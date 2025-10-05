import Layout from "./Layout.jsx";

import Wardrobe from "./Wardrobe";

import AddItem from "./AddItem";

import Community from "./Community";

import DonatePage from "./DonatePage";

import StyleAssistant from "./StyleAssistant";

import Landing from "./Landing";

import DonationReminder from "./DonationReminder";

import SpendingAlert from "./SpendingAlert";

import Analytics from "./Analytics";

import MyEvents from "./MyEvents";

import Chat from "./Chat";

import MyChats from "./MyChats";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Wardrobe: Wardrobe,
    
    AddItem: AddItem,
    
    Community: Community,
    
    DonatePage: DonatePage,
    
    StyleAssistant: StyleAssistant,
    
    Landing: Landing,
    
    DonationReminder: DonationReminder,
    
    SpendingAlert: SpendingAlert,
    
    Analytics: Analytics,
    
    MyEvents: MyEvents,
    
    Chat: Chat,
    
    MyChats: MyChats,
    
    Profile: Profile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Wardrobe />} />
                
                
                <Route path="/Wardrobe" element={<Wardrobe />} />
                
                <Route path="/AddItem" element={<AddItem />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/DonatePage" element={<DonatePage />} />
                
                <Route path="/StyleAssistant" element={<StyleAssistant />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/DonationReminder" element={<DonationReminder />} />
                
                <Route path="/SpendingAlert" element={<SpendingAlert />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/MyEvents" element={<MyEvents />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/MyChats" element={<MyChats />} />
                
                <Route path="/Profile" element={<Profile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}