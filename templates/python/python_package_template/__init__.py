"""This is the <%= packageSrcDirName %> package."""

from .main import add, hello, multiply  # re-export

__all__ = ['add', 'multiply', 'hello']
