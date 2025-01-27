from setuptools import setup, find_packages

setup(
    name="lmstudio-file-tools",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "PyPDF2",
        "gitpython"
    ]
) 