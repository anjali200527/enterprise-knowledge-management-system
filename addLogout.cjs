const fs = require('fs');

let jsx = fs.readFileSync('src/components/Navbar/Navbar.jsx', 'utf8');

if (!jsx.includes('FaSignOutAlt')) {
  jsx = jsx.replace(/FaUserCircle,/, 'FaUserCircle, FaSignOutAlt,');
}

if (!jsx.includes('handleLogout')) {
  jsx = jsx.replace('const navigateTo = (path) => {', `const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigateTo = (path) => {`);
}

const logoutJSX = `
        <div className="profile" onClick={() => navigateTo("/profile")} title="Profile">
          <FaUserCircle className="user-icon" />
        </div>
        <div className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="logout-icon" />
        </div>
`;

if (!jsx.includes('logout-btn')) {
  jsx = jsx.replace(/<div className="profile" onClick=\{\(\) => navigateTo\("\/profile"\)\} title="Profile">\s*<FaUserCircle className="user-icon" \/>\s*<\/div>/, logoutJSX);
  // Also catch version without title just in case
  jsx = jsx.replace(/<div className="profile" onClick=\{\(\) => navigateTo\("\/profile"\)\}>\s*<FaUserCircle className="user-icon" \/>\s*<\/div>/, logoutJSX);
}

fs.writeFileSync('src/components/Navbar/Navbar.jsx', jsx);

let css = fs.readFileSync('src/components/Navbar/Navbar.css', 'utf8');
if (!css.includes('.logout-btn')) {
  css += `
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  transition: background 0.2s;
  background: #FFFFFF;
  border: 1px solid #DCE6EA;
}

.logout-btn:hover {
  background: #E3F0F4;
}

.logout-icon {
  font-size: 1.4rem;
  color: #39758A;
}
`;
  fs.writeFileSync('src/components/Navbar/Navbar.css', css);
}

console.log('Navbar logout added.');
