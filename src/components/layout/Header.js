import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as CF from "../../config/function";
import { applyPop } from '../../store/popupSlice';
import ConfirmPop from '../popup/ConfirmPop';
import logo_big_b from "../../images/logo_big_b.svg";


const Header = () => {
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState(false);
    const [headerOn, setHeaderOn] = useState(null);
    const [menuOn, setMenuOn] = useState(null);
    const location = useLocation();
    const [mainPage, setMainPage] = useState(null);
    const [menuWrap, setMenuWrap] = useState(false);
    const [login, setLogin] = useState(false);
    const [userClassNum, setUserClassNum] = useState(null);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //메인페이지일때만 스크롤시 header active-----------
    const handleScroll = () => {
        if(mainPage){
            if(window.scrollY > 0) {
                setHeaderOn(true);
            }else{
                setHeaderOn(false);
            }
        }
    };
    
    useEffect(() => {    
        const timer = setInterval(() => {
            window.addEventListener("scroll", handleScroll);
        }, 100);
        return () => {
            clearInterval(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [mainPage]);


    //페이지이동시 메뉴on 변경
    useEffect(()=>{
        setMenuWrap(false);

        const path = location.pathname;
        if(path == "/"){
            setMenuOn(1);
            setMainPage(true);
        }else{
            setMenuOn(null);
            setMainPage(false);
        }
        
        if(path == "/ranking"){
            setMenuOn(2);
        }
    },[location]);


    //메인페이지일때만 headerOn false
    useEffect(()=>{
        if(mainPage){
            setHeaderOn(false);
        }else{
            setHeaderOn(true);
        }
    },[mainPage]);


    //로그인체크
    useEffect(()=>{
        setLogin(user.userLogin);
    },[user.userLogin]);


    //회원 랭킹정보 - 클래스번호 값 가져오기
    useEffect(()=>{
        if(user.userRank){
            const num = user.userRankData.class_number;
            setUserClassNum(num);
        }else{
            setUserClassNum(null);
        }
    },[user.userRank, user.userRankData]);



    return(<>
        <header id="header" className={`flex_center ${headerOn ? "on" : ""}`}>
            <div className="header_inner">
                <h1 className={`logo${!mainPage ? " logo_b" : ""}`}>
                    <Link to="/">사소한</Link>
                </h1>
                <nav className="gnb_wrap">
                    <ul className="gnb">
                        <li className={menuOn === 1 ? "on" : ""}><Link to="/">About 사소한</Link></li>
                        <li className=''><Link to="/about-vip">VIP 소개팅</Link></li>
                        <li className='is_submenu'>
                            <Link to="/square/all-feed">사소한 스퀘어</Link>
                            <div className='submenu_box'>
                                <ul>
                                    <li><Link to="/square/all-feed">피드 스퀘어</Link></li>
                                    <li><Link to="/square/manager-list">사소한 매니저</Link></li>
                                </ul>
                            </div>
                        </li>
                        <li className={menuOn === 2 ? "on" : ""}><Link to="/ranking">사소한 랭킹</Link></li>
                    </ul>
                </nav>
                <div className='utill_wrap flex'>
                    {login ?
                        <div className='profile_box is_submenu'>
                            <div className='flex'>
                                <div className={`profile_img_box${user.userRank ? ' class_'+userClassNum : ''}`}>
                                    <div className='img'>
                                        <div><img src={user.userInfo.m_f_photo} alt='프로필이미지' /></div>
                                    </div>
                                </div>
                                <p className='txt'>{user.userInfo.m_n_name}</p>
                            </div>
                            <div className='submenu_box'>
                                <ul>
                                    <li>
                                        {user.userInfo.user_level == 'U' ? <Link to={'/member/mypage'}>마이 프로필</Link> //일반회원일때 마이페이지로 이동
                                            : user.userInfo.user_level == 'M' && <Link to={'/square/manager/'+user.userInfo.m_id}>마이 프로필</Link> //매니저일때 매니저상세페이지로 이동
                                        }
                                    </li>
                                    <li><button type='button'>로그아웃</button></li>
                                </ul>
                            </div>
                        </div>
                        :   <ul className='link_ul flex'>
                                <li><Link to={'/member/login'}>로그인</Link></li>
                                <li><Link to={'/member/signup'}>회원가입</Link></li>
                            </ul>
                    }
                    <button type='button' className='btn_apply' onClick={()=>{
                        dispatch(applyPop(true));
                    }}>소개팅 신청</button>
                </div>
                <button type='button' className='btn_menu' onClick={()=>setMenuWrap(true)}>모바일메뉴열기버튼</button>
            </div>
            <div className={`menu_wrap${menuWrap ? " on" : ""}`}>
                <div className='dim'></div>
                <div className='menu_box'>
                    <div className='top_box flex_between'>
                        <img src={logo_big_b} alt="로고" />
                        <button type='button' className='btn_close' onClick={()=>setMenuWrap(false)}>모바일메뉴닫기버튼</button>
                    </div>
                    <div className='scroll_wrap'>
                        {login ?
                            <div className='profile_box flex_between'>
                                <div>
                                    <div className='flex pointer'
                                        onClick={()=>{
                                            //일반회원일때 마이페이지로 이동
                                            if(user.userInfo.user_level == 'U'){
                                                navigate('/member/mypage');
                                            }
                                            //매니저일때 매니저상세페이지로 이동
                                            if(user.userInfo.user_level == 'M'){
                                                navigate('/square/manager/'+user.userInfo.m_id);
                                            }
                                        }}
                                    >
                                        <div className={`profile_img_box${user.userRank ? ' class_'+userClassNum : ''}`}>
                                            <div className='img'>
                                                <div><img src={user.userInfo.m_f_photo} alt='프로필이미지' /></div>
                                            </div>
                                        </div>
                                        <p className='txt'>{user.userInfo.m_n_name}</p>
                                    </div>
                                    {user.userInfo.user_level == 'U' && //일반회원일때만 노출
                                        <div className='over_hidden'>
                                            <ul className='gray_name_box flex_wrap'>
                                                <li>{user.userInfo.m_name}</li>
                                                <li>{user.userInfo.m_address} / {user.userInfo.birth}</li>
                                            </ul>
                                        </div>
                                    }
                                    {user.userRank && //회원 랭킹값 있을때만 노출
                                        <div>
                                            <ul className='gray_name_box txt_ul2 flex'>
                                                <li><img src={require(`../../images/class_img${userClassNum}.png`)} alt="클래스이미지" /></li>
                                                <li className='flex'><span>LV.</span> {CF.MakeIntComma(user.userRankData.rank)}</li>
                                            </ul>
                                        </div>
                                    }
                                </div>
                                <button type='button' className='btn_logout'>로그아웃</button>
                            </div>
                            :   <ul className='link_ul flex_between'>
                                    <li><Link to={'/member/login'}>로그인</Link></li>
                                    <li><Link to={'/member/signup'}>회원가입</Link></li>
                                </ul>
                        }
                        <ul className='menu_list'>
                            <li className={menuOn === 1 ? "on" : ""}>
                                <Link to="/">About 사소한</Link>
                            </li>
                            <li className=''>
                                <Link to="/about-vip">VIP 소개팅</Link>
                            </li>
                            <li className=''>
                                <Link to="/">사소한 스퀘어</Link>
                                <ul className='submenu_ul flex_center'>
                                    <li>
                                        <Link to={'/square/all-feed'}>피드 스퀘어</Link>
                                    </li>
                                    <li>
                                        <Link to={'/square/manager-list'}>사소한 매니저</Link>
                                    </li>
                                </ul>
                            </li>
                            <li className={menuOn === 2 ? "on" : ""}>
                                <Link to="/ranking">사소한 랭킹</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Header;