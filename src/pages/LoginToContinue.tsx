import { Link } from "react-router-dom";

const LoginToContinue = () => (
  <div className="text-center p-10">
    <h1 className="text-4xl font-bold mb-4">Login To Continue</h1>
    <p className="text-lg">The page you’re looking is for loggedIn user.</p>
    <Link to="/" className="text-blue-600 underline mt-4 inline-block">
      Go to Home
    </Link>
  </div>
);

export default LoginToContinue;
