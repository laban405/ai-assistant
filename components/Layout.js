import { useTranslation } from 'next-i18next';
import Link from 'next/link'
import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { UncontrolledCollapse } from 'reactstrap';
import { API } from './config';
import Footer from './Footer'


export default function Layout({ children }) {
    const { t } = useTranslation();
    const [collapse, setCollapse] = useState([]);
    const api = new API();
    // get userId from current user logged in
    const user = 'Hasanur';
    const userId = 1;

    const { data: navItems, isLoading, error, refetch } = useQuery("navItems", async () => {
        const input = {
            userId, menu: true
        }
        const result = await api.create("/api/admin/common", input);
        return result;
    }, {
        keepPreviousData: true,
    });
    return (

        <div className="layout-wrapper">
            {/* <Sidebar layoutType={'vertical'} /> */}
            <div className='app-menu navbar-menu'>
                <ul className="navbar-nav" id="navbar-nav">
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/projects'}>
                            
                                <span>{'Projects'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/bugs'}>
                            
                                <span>{'bugs'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/leads'}>
                            
                                <span>{'leads'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/projects'}>
                            
                                <span>{'Projects'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/bugs'}>
                            
                                <span>{'bugs'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/leads'}>
                            
                                <span>{'leads'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className="menu-link">
                            <Link className='nav-link' href={'/admin/tasks'}>
                            
                                <span>{'tasks'}</span>
                            
                            </Link>
                        </div>
                    </li>
                    
                    

                </ul>
            </div>
            <div className="main-content">
                {children}
                <Footer />
            </div>
        </div>
    )
}
