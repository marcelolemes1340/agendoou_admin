
'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cores } from "@/lib/cores";
import { logout } from "../../services/api";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userName, setUserName] = useState("Admin");
    const [showHeader, setShowHeader] = useState(true); 
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
    
        if (pathname === '/login') {
            setShowHeader(false);
            return; 
        } else {
            setShowHeader(true);
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

    
        const loadUserData = () => {
            try {
                const userData = localStorage.getItem("adminUser");
                if (userData) {
                    const user = JSON.parse(userData);
                    const firstName = user.nome?.split(" ")[0] || "Admin";
                    setUserName(firstName);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        };

        loadUserData();
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pathname]); 

    const handleLogout = () => {
        if (confirm('Tem certeza que deseja sair do sistema?')) {
            logout();
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActivePath = (path) => {
        return pathname === path;
    };

    
    if (!showHeader) {
        return null;
    }

    return (
        <header 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: 'all 0.5s ease',
                padding: isScrolled ? '8px 0' : '16px 0',
                background: isScrolled 
                    ? `${cores.background.primary}EE` 
                    : cores.background.primary,
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
                borderBottom: `1px solid ${cores.primary.light}`
            }}
        >
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 16px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    
                    <Link 
                        href="/dashboard"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: cores.gradients.gold,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#000'
                        }}>
                            A
                        </div>
                        <span style={{
                            color: cores.neutral.white,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.5px'
                        }}>
                            Agendou
                        </span>
                    </Link>

                    
                    <nav style={{
                        display: 'none',
                        gap: '8px',
                        alignItems: 'center'
                    }} className="desktop-nav">
                        
                        {!isActivePath('/dashboard') && (
                            <Link 
                                href="/dashboard" 
                                style={{
                                    color: cores.neutral.white,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    background: isActivePath('/dashboard') ? cores.primary.light : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/dashboard')) {
                                        e.currentTarget.style.background = cores.primary.light;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/dashboard')) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                📊 Dashboard
                            </Link>
                        )}

                        
                        <Link 
                            href="/agendamento" 
                            style={{
                                color: isActivePath('/agendamento') ? cores.primary.accent : cores.neutral.white,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                background: isActivePath('/agendamento') ? cores.primary.light : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePath('/agendamento')) {
                                    e.currentTarget.style.background = cores.primary.light;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePath('/agendamento')) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            📋 Agendamentos
                        </Link>

                        
                        <Link 
                            href="/clientes" 
                            style={{
                                color: isActivePath('/clientes') ? cores.primary.accent : cores.neutral.white,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                background: isActivePath('/clientes') ? cores.primary.light : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePath('/clientes')) {
                                    e.currentTarget.style.background = cores.primary.light;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePath('/clientes')) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            👥 Clientes
                        </Link>

                        
                        <Link 
                            href="/barbeiros" 
                            style={{
                                color: isActivePath('/barbeiros') ? cores.primary.accent : cores.neutral.white,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                background: isActivePath('/barbeiros') ? cores.primary.light : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePath('/barbeiros')) {
                                    e.currentTarget.style.background = cores.primary.light;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePath('/barbeiros')) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            💈 Barbeiros
                        </Link>

                        
                        <Link 
                            href="/avaliacoes" 
                            style={{
                                color: isActivePath('/avaliacoes') ? cores.primary.accent : cores.neutral.white,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                background: isActivePath('/avaliacoes') ? cores.primary.light : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePath('/avaliacoes')) {
                                    e.currentTarget.style.background = cores.primary.light;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePath('/avaliacoes')) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            ⭐ Avaliações
                        </Link>

                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            background: cores.background.secondary,
                            border: `1px solid ${cores.primary.light}`
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                background: cores.status.success,
                                borderRadius: '50%'
                            }}></div>
                            <span style={{
                                color: cores.neutral.white,
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                👋 Olá, {userName}
                            </span>
                        </div>

                        
                        <button
                            onClick={handleLogout}
                            style={{
                                background: cores.primary.accent,
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F7EF8A';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = cores.primary.accent;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            🚪 Sair
                        </button>
                    </nav>

                    
                    <button 
                        onClick={toggleMenu}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}
                        className="mobile-menu-btn"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = cores.primary.light;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                        }}
                        aria-label="Menu"
                    >
                        <div style={{ width: '24px', height: '24px', position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '4px',
                                width: '24px',
                                height: '2px',
                                background: cores.neutral.white,
                                transition: 'all 0.3s ease',
                                transform: isMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                            }}></span>
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '11px',
                                width: '24px',
                                height: '2px',
                                background: cores.neutral.white,
                                transition: 'all 0.3s ease',
                                opacity: isMenuOpen ? 0 : 1
                            }}></span>
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '18px',
                                width: '24px',
                                height: '2px',
                                background: cores.neutral.white,
                                transition: 'all 0.3s ease',
                                transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
                            }}></span>
                        </div>
                    </button>
                </div>

                
                <div style={{
                    display: 'none',
                    transition: 'all 0.5s ease',
                    overflow: 'hidden'
                }} className={`mobile-menu ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
                    <div style={{
                        background: cores.background.card,
                        borderRadius: '12px',
                        padding: '16px',
                        border: `1px solid ${cores.primary.light}`,
                        marginTop: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            
                            <div style={{
                                color: cores.neutral.white,
                                padding: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                borderRadius: '8px',
                                textAlign: 'center',
                                background: cores.background.secondary,
                                border: `1px solid ${cores.primary.light}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        background: cores.status.success,
                                        borderRadius: '50%'
                                    }}></div>
                                    <span>👋 Olá, {userName}</span>
                                </div>
                            </div>

                            
                            {!isActivePath('/dashboard') && (
                                <Link 
                                    href="/dashboard" 
                                    style={{
                                        color: cores.neutral.white,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: isActivePath('/dashboard') ? cores.primary.light : cores.background.secondary,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => setIsMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        if (!isActivePath('/dashboard')) {
                                            e.currentTarget.style.background = cores.primary.light;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActivePath('/dashboard')) {
                                            e.currentTarget.style.background = cores.background.secondary;
                                        }
                                    }}
                                >
                                    <span>📊</span>
                                    <span>Dashboard</span>
                                </Link>
                            )}

                        
                            <Link 
                                href="/agendamento" 
                                style={{
                                    color: cores.neutral.white,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isActivePath('/agendamento') ? cores.primary.light : cores.background.secondary,
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setIsMenuOpen(false)}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/agendamento')) {
                                        e.currentTarget.style.background = cores.primary.light;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/agendamento')) {
                                        e.currentTarget.style.background = cores.background.secondary;
                                    }
                                }}
                            >
                                <span>📋</span>
                                <span>Agendamentos</span>
                            </Link>

                            
                            <Link 
                                href="/clientes" 
                                style={{
                                    color: cores.neutral.white,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isActivePath('/clientes') ? cores.primary.light : cores.background.secondary,
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setIsMenuOpen(false)}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/clientes')) {
                                        e.currentTarget.style.background = cores.primary.light;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/clientes')) {
                                        e.currentTarget.style.background = cores.background.secondary;
                                    }
                                }}
                            >
                                <span>👥</span>
                                <span>Clientes</span>
                            </Link>

                            
                            <Link 
                                href="/barbeiros" 
                                style={{
                                    color: cores.neutral.white,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isActivePath('/barbeiros') ? cores.primary.light : cores.background.secondary,
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setIsMenuOpen(false)}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/barbeiros')) {
                                        e.currentTarget.style.background = cores.primary.light;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/barbeiros')) {
                                        e.currentTarget.style.background = cores.background.secondary;
                                    }
                                }}
                            >
                                <span>💈</span>
                                <span>Barbeiros</span>
                            </Link>

                            
                            <Link 
                                href="/avaliacoes" 
                                style={{
                                    color: cores.neutral.white,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isActivePath('/avaliacoes') ? cores.primary.light : cores.background.secondary,
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setIsMenuOpen(false)}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/avaliacoes')) {
                                        e.currentTarget.style.background = cores.primary.light;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/avaliacoes')) {
                                        e.currentTarget.style.background = cores.background.secondary;
                                    }
                                }}
                            >
                                <span>⭐</span>
                                <span>Avaliações</span>
                            </Link>
                            
                            
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: cores.primary.accent,
                                    color: '#000',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    marginTop: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F7EF8A';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = cores.primary.accent;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (min-width: 768px) {
                    .desktop-nav {
                        display: flex !important;
                    }
                    .mobile-menu-btn {
                        display: none !important;
                    }
                    .mobile-menu {
                        display: none !important;
                    }
                }

                @media (max-width: 767px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .mobile-menu {
                        display: block !important;
                    }
                    .menu-open {
                        max-height: 500px;
                        opacity: 1;
                    }
                    .menu-closed {
                        max-height: 0;
                        opacity: 0;
                    }
                }
            `}</style>
        </header>
    );
}